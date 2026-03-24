import { useCallback, useLayoutEffect, useState } from "react";

export const useGridColumns = () => {
  const [cardsPerPage, setCardsPerPage] = useState(1);

  const updateCardsPerPage = useCallback(() => {
    const rawValue = getComputedStyle(document.documentElement)
      .getPropertyValue("--gridColumns")
      .trim();
    const parsed = Number.parseInt(rawValue, 10);
    setCardsPerPage(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
  }, []);

  useLayoutEffect(() => {
    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => {
      window.removeEventListener("resize", updateCardsPerPage);
    };
  }, [updateCardsPerPage]);

  return cardsPerPage;
};
