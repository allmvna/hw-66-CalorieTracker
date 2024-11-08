import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { NavLink } from "react-router-dom";
import axiosAPI from "../../axiosAPI.ts";
import { useCallback, useEffect, useState } from "react";
import { ITracker, ITrackerAPI } from "../../types";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Preloader from "../../UI/Preloader/Preloader.tsx";

const MealList = () => {
  const [meals, setMeals] = useState<ITracker[]>([]);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<{ [id: string]: boolean }>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response: { data: ITrackerAPI } = await axiosAPI.get("meal.json?orderBy/date");

      if (response.data) {
        const mealFromAPI = Object.keys(response.data).map((mealId) => {
          return {
            ...response.data[mealId],
            id: mealId,
          };
        })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setMeals(mealFromAPI);

        const totalCalories: number = mealFromAPI.reduce(
          (acc, meal) => acc + (meal.calories || 0),
          0,
        );
        setTotalCalories(totalCalories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMeal = async (id: string) => {
    setIsSubmitting((prev) => ({ ...prev, [id]: true }));
    try {
      const mealToDelete = meals.find((meal) => meal.id === id);
      if (mealToDelete) {
        await axiosAPI.delete(`/meal/${id}.json`);
        setMeals((prevMeals) => {
          const updatedMeals = prevMeals.filter((meal) => meal.id !== id);
          setTotalCalories(
            (prevTotal) => prevTotal - (mealToDelete.calories || 0),
          );
          return updatedMeals;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) {
    return <Preloader />;
  }
  return (
    <>
      <Typography
        variant="h4"
        sx={{ mb: 2, textAlign: "center", color: "#000" }}
      >
        Meals
      </Typography>
      {meals.length === 0 ? (
        <Alert severity="info">
          There are no values yet. Go to the "Add" page to add a new meal!
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {meals.map((meal) => (
            <Grid size={12} key={meal.id}>
              <Card
                sx={{
                  minWidth: 275,
                  backgroundColor: "inherit",
                  border: "3px solid",
                  borderRadius: "10px",
                  p: 1,
                  display: "flex",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                      gutterBottom
                      sx={{ fontSize: 14, textAlign: 'center'}}
                  >
                    {meal.date}
                  </Typography>
                  <Typography
                    gutterBottom
                    sx={{ fontSize: 18, color: "secondary" }}
                  >
                    {meal.nameCategory}
                  </Typography>
                  <hr />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                      {meal.description}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 16, marginLeft: 2, fontWeight: 600 }}
                    >
                      {meal.calories} kcal
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions
                  sx={{ justifyContent: "flex-end", display: "flex" }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <Button
                      component={NavLink}
                      to={`/new_meal/${meal.id}`}
                      variant="contained"
                      size="medium"
                    >
                      {<ModeEditOutlineIcon />}
                    </Button>
                    <Button
                      onClick={() => deleteMeal(meal.id)}
                      variant="contained"
                      size="medium"
                      color="error"
                      disabled={isSubmitting[meal.id]}
                    >
                      {isSubmitting[meal.id] ? (
                          <CircularProgress size={20} />
                      ) : (
                          <DeleteOutlineIcon />
                      )}
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {meals.length > 0 && totalCalories > 0 && (
        <Box mt={2}>
          <Typography variant="h6" sx={{ color: "black", textAlign: "center" }}>
            <b>Total count: </b>
            {totalCalories} calories
          </Typography>
        </Box>
      )}
    </>
  );
};

export default MealList;
